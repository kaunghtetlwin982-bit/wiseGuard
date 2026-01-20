"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClient = generateClient;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const WG_DIR = "/etc/wireguard";
const CLIENT_DIR = `${WG_DIR}/clients`;
const WG_CONF = `${WG_DIR}/wg0.conf`;
const SERVER_PUBLIC_KEY = fs_1.default.readFileSync(`${WG_DIR}/server_public.key`, "utf8").trim();
const ENDPOINT = "150.95.82.134:51820";
function generateClient(name, ip) {
    const privateKey = (0, child_process_1.execSync)("wg genkey").toString().trim();
    const publicKey = (0, child_process_1.execSync)(`echo ${privateKey} | wg pubkey`).toString().trim();
    // client config
    const clientConf = `
[Interface]
PrivateKey = ${privateKey}
Address = 10.10.0.${ip}/32
DNS = 1.1.1.1
MTU = 1380

[Peer]
PublicKey = ${SERVER_PUBLIC_KEY}
Endpoint = ${ENDPOINT}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`.trim();
    fs_1.default.writeFileSync(`${CLIENT_DIR}/${name}.conf`, clientConf);
    fs_1.default.writeFileSync(`${CLIENT_DIR}/${name}_private.key`, privateKey);
    fs_1.default.writeFileSync(`${CLIENT_DIR}/${name}_public.key`, publicKey);
    // append peer to server
    fs_1.default.appendFileSync(WG_CONF, `\n\n[Peer]\nPublicKey = ${publicKey}\nAllowedIPs = 10.10.0.${ip}/32\n`);
    // reload wireguard safely
    (0, child_process_1.execSync)("wg syncconf wg0 <(wg-quick strip wg0)", { shell: "/bin/bash" });
    return { clientConf, publicKey, privateKey, ip };
}
