import { io, Socket } from "socket.io-client";
import type { RpcActivityPayload } from "./activity";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3000;

export class BloumeRpcClient {
    private socket: Socket | null = null;
    private serverUrl: string;
    private rpcToken: string;
    private retryCount = 0;
    private retryTimer: NodeJS.Timeout | null = null;
    private destroyed = false;

    constructor(serverUrl: string, rpcToken: string) {
        this.serverUrl = serverUrl;
        this.rpcToken = rpcToken;
    }

    connect(): void {
        if (this.destroyed) return;

        this.socket = io(this.serverUrl, {
            auth: { rpcToken: this.rpcToken },
            transports: ["websocket"],
            reconnection: false,
        });

        this.socket.on("connect", () => {
            this.retryCount = 0;
            console.log("[BloumeChat RPC] Connected");
        });

        this.socket.on("disconnect", () => {
            console.log("[BloumeChat RPC] Disconnected");
            this.scheduleReconnect();
        });

        this.socket.on("connect_error", (err: Error) => {
            console.error("[BloumeChat RPC] Connection error:", err.message);
            this.socket?.close();
            this.scheduleReconnect();
        });
    }

    private scheduleReconnect(): void {
        if (this.destroyed || this.retryCount >= MAX_RETRIES) return;
        this.retryCount++;
        const delay = BASE_DELAY_MS * Math.pow(2, this.retryCount - 1);
        this.retryTimer = setTimeout(() => {
            if (!this.destroyed) this.connect();
        }, delay);
    }

    setActivity(activity: RpcActivityPayload | null): void {
        if (!this.socket?.connected) return;
        const payload = activity ?? { type: "none" as const, name: "" };
        this.socket.emit("activity:update", payload);
    }

    disconnect(): void {
        this.destroyed = true;
        if (this.retryTimer) clearTimeout(this.retryTimer);
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
