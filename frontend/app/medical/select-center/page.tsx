"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import useApi from "@/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Building } from "lucide-react"

interface MedicalCenter {
  id_CentroVacunacion: number
  Nombre: string
  EsPrincipal: boolean
}

export default function SelectCenterPage() {
  const { user, setSelectedCenter, selectedCenter, loading: authLoading } = useAuth()
  const router = useRouter()
  const { request: fetchCenters, loading: centersLoading } = useApi<MedicalCenter[]>()
  const [centers, setCenters] = useState<MedicalCenter[]>([])

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.id_Rol !== 2) { // Changed to use id_Rol for Medico role
      router.push("/dashboard");
      return;
    }

    // If a center is selected, redirect to the appointments page.
    if (selectedCenter) {
      router.push("/management/medical/appointments");
      return; // Stop further execution
    }

    const loadCenters = async () => {
      try {
        const data = await fetchCenters(`/api/users/${user.id}/centers`);
        if (data) {
          setCenters(data);
        }
      } catch (error) {
        console.error("Failed to fetch medical centers:", error);
      }
    };

    loadCenters();
  }, [user, authLoading, router, fetchCenters, selectedCenter]);

  const handleCenterSelect = (center: MedicalCenter) => {
    setSelectedCenter(center)
  }

  // Show a loader while auth is loading, centers are loading, or while redirecting after selection
  if (authLoading || centersLoading || selectedCenter) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Seleccione un Centro de Trabajo</CardTitle>
            <CardDescription>Elija el centro de vacunación en el que atenderá hoy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {centers.map((center) => (
              <Button
                key={center.id_CentroVacunacion}
                variant={center.EsPrincipal ? "default" : "outline"}
                className="w-full justify-start p-6 text-lg"
                onClick={() => handleCenterSelect(center)}
              >
                <Building className="mr-4 h-6 w-6" />
                <div className="text-left">
                  <div>{center.Nombre}</div>
                  {center.EsPrincipal && <div className="text-xs font-light">(Principal)</div>}
                </div>
              </Button>
            ))}
            {centers.length === 0 && !centersLoading && (
              <p className="text-center text-muted-foreground">No tiene centros asignados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
