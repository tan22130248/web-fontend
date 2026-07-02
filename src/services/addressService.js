import http from "../utils/http";

export const addressService = {
  getAddresses: () => http.get("/api/user-addresses"),
  createAddress: (data) => http.post("/api/user-addresses", data),
};

export default addressService;
