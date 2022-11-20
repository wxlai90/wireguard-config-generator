import generateKeys from "./wireguard";

export const createPeer = (partialSubnet, i) => {
  const keys = generateKeys();
  const peer = {
    ...keys,
    address: partialSubnet + i + "/24",
  };

  return peer;
};
