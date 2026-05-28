import { io, Socket } from "socket.io-client";
import type { RpcActivityPayload } from "./activity";

/** Fixed BloumeChat realtime endpoint. NOT user-configurable. */
const SERVER_URL = "wss://api.bloumechat.com";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3000;

export type RpcStatus = "connecting" | "connected" | "disconnected";

export class BloumeRpcClient {
    private socket: Socket | null = null;
    private rpcToken: string;
    private retryCount = 0;
    private retryTimer: NodeJS.Timeout | null = null;
    private destroyed = false;
    private readonly onStatus: (status: RpcStatus) => void;

    constructor(rpcToken: string, onStatus: (status: RpcStatus) => void) {
        this.rpcToken = rpcToken;
        this.onStatus = onStatus;
    }

    get connected(): boolean {
        return !!this.socket?.connected;
    }

    connect(): void {
        if (this.destroyed) return;
        this.onStatus("connecting");

        this.socket = io(SERVER_URL, {
            auth: { rpcToken: this.rpcToken },
            transports: ["websocket"],
            reconnection: false,
        });

        this.socket.on("connect", () => {
            this.retryCount = 0;
            this.onStatus("connected");
        });

        this.socket.on("disconnect", () => {
            this.onStatus("disconnected");
            this.scheduleReconnect();
        });

        this.socket.on("connect_error", (err: Error) => {
            console.error("[BloumeChat RPC] Connection error:", err.message);
            this.onStatus("disconnected");
            this.socket?.close();
            this.scheduleReconnect();
        });
    }

    private scheduleReconnect(): void {
        if (this.destroyed || this.retryCount >= MAX_RETRIES) return;
        this.retryCount++;
        const delay = BASE_DELAY_MS * Math.pow(2, this.retryCount - 1);
        this.onStatus("connecting");
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
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.onStatus("disconnected");
    }
}
