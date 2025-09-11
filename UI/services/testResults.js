import { getToken } from "./authService";
const API_URL = "http://localhost:5000/api/tests";


export const saveTestResult = async (resultData) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/setTestResult`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resultData),
  });
  if (!res.ok) throw new Error("Failed to save test result");
  return res.json();
};

export const getTestResults = async () => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/getResults`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
};