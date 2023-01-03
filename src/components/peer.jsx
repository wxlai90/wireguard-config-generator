import QRCode from "qrcode";
import { useEffect, useRef } from "react";

const Peer = ({
  idx,
  peer,
  showToast,
  copyClientToClipboard,
  partialSubnet,
  config,
  generatedConfig,
  mask,
}) => {
  const qrRef = useRef();

  let configToExport = "[Interface]" + "\n";
  configToExport += `PrivateKey = ${peer.privateKey}\n`;
  configToExport += `Address = ${partialSubnet + (idx + 2)}/${mask}\n`;
  if (config.dns !== "") {
    configToExport += `DNS = ${config.dns}\n`;
  }
  configToExport += "\n";
  configToExport += "[Peer]\n";
  configToExport += `PublicKey = ${generatedConfig.server.publicKey}\n`;
  configToExport += `AllowedIPs = ${config.allowedIPs}\n`;
  configToExport += `Endpoint = ${config.endpoint}:${config.port}\n`;
  configToExport += "\n";

  useEffect(() => {
    QRCode.toCanvas(qrRef.current, configToExport, {
      errorCorrectionLevel: "M",
      scale: 2.1,
    });
  }, []);

  return (
    <div className="peer-display">
      <h2>Peer {idx + 1}</h2>
      <div className="config" onClick={copyClientToClipboard}>
        {showToast.client && <div className="toast">Copied!</div>}
        <p>[Interface]</p>
        <p>PrivateKey = {peer.privateKey}</p>
        <p>
          Address = {partialSubnet + (idx + 2)}/{mask}
        </p>
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
      <canvas ref={qrRef}></canvas>
    </div>
  );
};

export default Peer;
