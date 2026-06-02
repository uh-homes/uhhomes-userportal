import { useEffect, useState } from "react";
import api from "../Api/api";

export default function useProject() {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getProject = async () => {
    try {
      setIsLoading(true);
      const fetchedProject = await api.get(`/user-projects`);
      setProject(fetchedProject.data.data);
    } catch (error) {
      setError(error?.response?.data?.message || error?.message || "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  return { project, getProject, error, isLoading };
}
