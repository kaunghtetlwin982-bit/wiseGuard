import { execSync } from "child_process";
import fs from "fs";

const WG_DIR = "/etc/wireguard";
const CLIENT_DIR = `${WG_DIR}/clients`;
const WG_CONF = `${WG_DIR}/wg0.conf`;
const SERVER_PUBLIC_KEY = fs.readFileSync(`${WG_DIR}/server_public.key`, "utf8").trim();
const ENDPOINT = "150.95.82.134:51820";

export function generateClient(name: string, ip: number) {
  const privateKey = execSync("wg genkey").toString().trim();
  const publicKey = execSync(`echo ${privateKey} | wg pubkey`).toString().trim();

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

  fs.writeFileSync(`${CLIENT_DIR}/${name}.conf`, clientConf);
  fs.writeFileSync(`${CLIENT_DIR}/${name}_private.key`, privateKey);
  fs.writeFileSync(`${CLIENT_DIR}/${name}_public.key`, publicKey);

  // append peer to server
  fs.appendFileSync(
    WG_CONF,
    `\n\n[Peer]\nPublicKey = ${publicKey}\nAllowedIPs = 10.10.0.${ip}/32\n`
  );

  // reload wireguard safely
  execSync("wg syncconf wg0 <(wg-quick strip wg0)", { shell: "/bin/bash" });

  return { clientConf, publicKey, privateKey, ip };
}
