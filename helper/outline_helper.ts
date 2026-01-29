
import axios from "axios";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false, // trust self-signed cert
});


// const OUTLINE_API="https://150.95.82.134:60248/Jk2U7DyIeIYR-dN6jTYolA"


export async function createVpnKey(name : string,OUTLINE_API: string ) {
  const { data } = await axios.post(
    `${OUTLINE_API}/access-keys`,
    {},
    { httpsAgent: agent }
  );

  console.log("Data : ", data)
  // if (name) {
  //   await axios.put(
  //     `${OUTLINE_API}/access-keys/${data.id}/name`,
  //     { name },
  //     { httpsAgent: agent }
  //   );
  // }

  return data;
}


export async function listVpnKeys(OUTLINE_API: string) {
  const { data } = await axios.get(
    `${OUTLINE_API}/access-keys`,
    { httpsAgent: agent }
  );

  return data.accessKeys;
}

export async function deleteVpnKey(keyId: string, OUTLINE_API: string) {
  const { data } = await axios.delete(
    `${OUTLINE_API}/access-keys/${keyId}`,
    { httpsAgent: agent }
  );
  return data;
}

export async function updateVpnKeyName(keyId: string, name: string, OUTLINE_API: string) {
  const { data } = await axios.put(
    `${OUTLINE_API}/access-keys/${keyId}/name`,
    { name },
    { httpsAgent: agent }
  );
  return data;
}
