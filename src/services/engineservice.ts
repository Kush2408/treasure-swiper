import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
});

export type EnginePropulsionResponse = unknown; // replace with real shape when available

export const getEnginePropulsion = async (): Promise<EnginePropulsionResponse> => {
	const { data } = await api.get("/engine-propulsion");
	return data;
};