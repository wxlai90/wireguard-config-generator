import JSZip from "jszip";
import { useEffect, useState } from "react";
import { createPeer } from "../peer";
import generateKeys from "../wireguard";

const ConfigFile = (props) => {
  const { config } = props;
  const [peerCount, setPeerCount] = useState(1);
  const [showToast, setShowToast] = useState({
    server: false,
    client: false,
  });
  const [generatedConfig, setGeneratedConfig] = useState({
    server: generateKeys(),
    client: {},
    peers: [],
  });

  const [networkAddress, mask] = config.networkCIDR.split("/");
  const partialSubnet =
    networkAddress.split(".")[0] +
    "." +
    networkAddress.split(".")[1] +
    "." +
    networkAddress.split(".")[2] +
    ".";

  useEffect(() => {
    const newPeer = createPeer(partialSubnet, peerCount + 1);

    setGeneratedConfig({
      ...generatedConfig,
      peers: [...generatedConfig.peers, newPeer],
    });
  }, [peerCount]);

  const generateConfigs = () => {
    const res = {};

    let configToExport = "[Interface]" + "\n";
    configToExport +=
      `PrivateKey = ${generatedConfig.server.privateKey}` + "\n";
    configToExport += `Address = ${partialSubnet + 1}/24` + "\n";
    configToExport += `ListenPort = ${config.port}` + "\n";
    configToExport += `PostUp = ${config.postupRule}` + "\n";
    configToExport += `PostDown = ${config.postdownRule}` + "\n";
    configToExport += "\n";
    configToExport += "\n";
    generatedConfig.peers.forEach((peer, idx) => {
      configToExport += `# Peer ${idx + 1}\n`;
      configToExport += "[Peer]\n";
      configToExport += `PublicKey = ${peer.publicKey}\n`;
      configToExport += `AllowedIPs = ${partialSubnet + (idx + 2)}/32\n`;
      configToExport += "\n";
    });

    res.server = configToExport;

    let clients = "";
    configToExport = "";
    generatedConfig.peers.forEach((peer, idx) => {
      configToExport = `# Peer ${idx + 1}\n`;
      configToExport += "[Interface]" + "\n";
      configToExport += `PrivateKey = ${peer.privateKey}\n`;
      configToExport += `Address = ${partialSubnet + (idx + 2)}/24\n`;
      if (config.dns !== "") {
        configToExport += `DNS = ${config.dns}\n`;
      }
      configToExport += "\n";
      configToExport += "[Peer]\n";
      configToExport += `PublicKey = ${generatedConfig.server.publicKey}\n`;
      configToExport += `AllowedIPs = ${config.allowedIPs}\n`;
      configToExport += `Endpoint = ${config.endpoint}:${config.port}\n`;
      configToExport += "\n";
      clients += configToExport;
    });

    return {
      ...res,
      clients,
    };
  };

  const copyServerToClipboard = () => {
    setShowToast((p) => ({ ...p, server: true }));
    const { server } = generateConfigs();

    navigator.clipboard
      .writeText(server)
      .then((_) => _)
      .catch(console.error);

    setTimeout(() => {
      setShowToast((p) => ({ ...p, server: false }));
    }, 1000);
  };

  const copyClientToClipboard = () => {
    setShowToast((p) => ({ ...p, client: true }));
    const { clients } = generateConfigs();

    navigator.clipboard
      .writeText(clients)
      .then((_) => _)
      .catch(console.error);
    setTimeout(() => {
      setShowToast((p) => ({ ...p, client: false }));
    }, 1000);
  };

  const downloadConfigs = (e) => {
    e.preventDefault();
    const { server, clients } = generateConfigs();
    const zip = new JSZip();
    zip.file("wg0_server.conf", server);
    zip.file("wg0_clients.conf", clients);
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = window.URL.createObjectURL(new Blob([content]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "wireguard.zip";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          setPeerCount((p) => p + 1);
        }}
      >
        Add Peer
      </button>

      <button onClick={downloadConfigs}>Download Configs as Zip</button>
      <div>
        <h1 className="config-header">Server Config</h1>
        <div className="config" onClick={copyServerToClipboard}>
          {showToast.server && <div className="toast">Copied!</div>}
          <p>[Interface]</p>
          <p>PrivateKey = {generatedConfig.server.privateKey}</p>
          <p>Address = {partialSubnet + 1}/24</p>
          <p>ListenPort = {config.port}</p>
          <p>PostUp = {config.postupRule}</p>
          <p>PostDown = {config.postdownRule}</p>
          <br />
          {generatedConfig.peers.map((peer, idx) => {
            return (
              <div key={idx}>
                <p>[Peer]</p>
                <p>PublicKey = {peer.publicKey}</p>
                <p>AllowedIPs = {partialSubnet + (idx + 2)}/32</p>
                <br />
              </div>
            );
          })}
          <br />
        </div>

        <div>
          <h1 className="config-header">
            Client Config{generatedConfig.peers.length > 1 && "s"}
          </h1>
          <div>
            {generatedConfig.peers.map((peer, idx) => {
              return (
                <div key={idx}>
                  <h2>Peer {idx + 1}</h2>
                  <div className="config" onClick={copyClientToClipboard}>
                    {showToast.client && <div className="toast">Copied!</div>}
                    <p>[Interface]</p>
                    <p>PrivateKey = {peer.privateKey}</p>
                    <p>Address = {partialSubnet + (idx + 2)}/24</p>
                    {config.dns && <p>DNS = {config.dns}</p>}
                    <br />
                    <p>[Peer]</p>
                    <p>PublicKey = {generatedConfig.server.publicKey}</p>
                    <p>AllowedIPs = {config.allowedIPs}</p>
                    <p>
                      Endpoint = {config.endpoint}:{config.port}
                    </p>
                  </div>
                  <br />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile;
