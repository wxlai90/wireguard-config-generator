import generateKeys from "./wireguard";

export const createPeer = (partialSubnet, mask, i) => {
  const keys = generateKeys();
  const peer = {
    ...keys,
    address: partialSubnet + i + "/" + mask,
  };

  return peer;
};
