// import axios from "axios";

// // const OUTLINE_API = process.env.OUTLINE_API_URL;
// const OUTLINE_API="https://150.95.82.134:60248/Jk2U7DyIeIYR-dN6jTYolA"

// export async function createVpnKey(name : string) {
//   const { data } = await axios.post(`${OUTLINE_API}`);

//   if (name) {
//     await axios.put(
//       `${OUTLINE_API}/access-keys/${data.id}/name`,
//       { name }
//     );
//   }

//   return data;
// }


import axios from "axios";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false, // trust self-signed cert
});


const OUTLINE_API="https://150.95.82.134:60248/Jk2U7DyIeIYR-dN6jTYolA"


export async function createVpnKey(name : string) {
  const { data } = await axios.post(
    `${OUTLINE_API}/access-keys`,
    {},
    { httpsAgent: agent }
  );

  if (name) {
    await axios.put(
      `${OUTLINE_API}/access-keys/${data.id}/name`,
      { name },
      { httpsAgent: agent }
    );
  }

  return data;
}
