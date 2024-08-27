export const extractLatLong = (latLong: string): { latitude: number; longitude: number } => {
  const [lat, lon] = latLong.split(",").map(coord => parseFloat(coord.trim()));
  return { latitude: lat, longitude: lon };
};