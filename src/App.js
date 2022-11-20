import { useState } from "react";
import "./App.css";
import ConfigFile from "./components/configfile";

const App = () => {
  const [state, setState] = useState({
    port: "51820",
    allowedIPs: "0.0.0.0/0, ::/0",
    networkCIDR: "10.0.0.0/24",
    endpoint: "my.wireguard.server",
    dns: "",
    postupRule:
      "iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE",
    postdownRule:
      "iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE",
  });

  const [showConfig, setShowConfig] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfig(true);
  };

  const handleChange = ({ target: { name, value } }) => {
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="container">
      <div>
        <h1 className="header">Wireguard Config Generator</h1>
      </div>

      {showConfig ? (
        <ConfigFile config={state} />
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Port
              <input
                type="text"
                onChange={handleChange}
                name="port"
                value={state.port}
              />
            </label>

            <label>
              AllowedIPs
              <input
                type="text"
                onChange={handleChange}
                name="allowedIPs"
                value={state.allowedIPs}
              />
            </label>

            <label>
              CIDR
              <input
                type="text"
                onChange={handleChange}
                name="networkCIDR"
                value={state.networkCIDR}
              />
            </label>

            <label>
              Endpoint
              <input
                type="text"
                onChange={handleChange}
                name="endpoint"
                value={state.endpoint}
              />
            </label>

            <label>
              DNS (Optional)
              <input
                type="text"
                onChange={handleChange}
                name="dns"
                value={state.dns}
              />
            </label>

            <label>
              Post-Up iptables rule
              <input
                type="text"
                onChange={handleChange}
                name="postupRule"
                value={state.postupRule}
              />
            </label>

            <label>
              Post-Down iptables rule
              <input
                type="text"
                onChange={handleChange}
                name="postdownRule"
                value={state.postdownRule}
              />
            </label>

            <button>Generate Config</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
