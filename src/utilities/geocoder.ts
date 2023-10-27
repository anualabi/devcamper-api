import node_geocoder from "node-geocoder";
import config from "config";

const options = {
  provider: config.get<"mapquest">("geocoder.provider"),
  httpAdapter: "https",
  apiKey: config.get<string>("geocoder.apiKey"),
  formatter: null,
};

const geocoder = node_geocoder(options);

export default geocoder;
