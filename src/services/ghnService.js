import http from "../utils/http";

export const ghnService = {
  getProvinces: () => http.get("/api/ghn/locations/provinces"),

  getDistricts: (provinceId) =>
    http.get("/api/ghn/locations/districts", { provinceId }),

  getWards: (districtId) =>
    http.get("/api/ghn/locations/wards", { districtId }),
};

export default ghnService;
