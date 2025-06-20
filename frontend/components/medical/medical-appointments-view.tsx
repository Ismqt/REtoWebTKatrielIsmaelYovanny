"use client"

import { useState, useEffect, useCallback } from "react"
import useApi from "@/hooks/use-api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Syringe, MapPin, AlertCircle } from "lucide-react"
import { AttendAppointmentModal } from "./attend-appointment-modal"
import type { MedicalAppointment } from "@/types/medical"

export function MedicalAppointmentsView() {
  const { user, selectedCenter } = useAuth()
  const { toast } = useToast()
  const { request: fetchAppointments, loading } = useApi<MedicalAppointment[]>()

  const [appointments, setAppointments] = useState<MedicalAppointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<MedicalAppointment | null>(null)
  const [isAttendModalOpen, setIsAttendModalOpen] = useState(false)

  const loadAppointments = useCallback(async () => {
    if (!user?.id || !selectedCenter?.id_CentroVacunacion) {
      console.log("User or selected center not available, skipping appointment load.");
      return;
    }

    try {
      const apiUrl = `/api/medical/appointments?id_centro=${selectedCenter.id_CentroVacunacion}`;
      console.log(`Fetching appointments from: ${apiUrl}`);
      const data = await fetchAppointments(apiUrl);
      console.log("🔍 Raw appointments data:", data);
      setAppointments(data || []);
    } catch (error) {
      console.error("Error loading medical appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las citas médicas",
      });
    }
  }, [fetchAppointments, user?.id, selectedCenter, toast]);

  useEffect(() => {
    if (selectedCenter) {
      loadAppointments();
    }
  }, [loadAppointments, selectedCenter]);

  const handleAttendAppointment = (appointment: MedicalAppointment) => {
    setSelectedAppointment(appointment)
    setIsAttendModalOpen(true)
  }

  const handleAppointmentAttended = () => {
    setIsAttendModalOpen(false)
    setSelectedAppointment(null)
    loadAppointments()
    toast({
      title: "Cita Atendida",
      description: "La cita ha sido procesada exitosamente",
    })
  }

  // Función para formatear fecha sin conversión de zona horaria
  const formatAppointmentDate = (dateStr: string) => {
    if (!dateStr) return "Fecha no disponible"

    try {
      // Extraer solo YYYY-MM-DD
      const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr
      const [year, month, day] = datePart.split("-")

      // Crear fecha local sin conversión UTC
      const date = new Date(Number(year), Number(month) - 1, Number(day))

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  // Función para formatear hora desde el formato extraño del backend
  const formatAppointmentTime = (timeStr: string) => {
    if (!timeStr) return "Hora no disponible"

    try {
      // Extraer hora de '1970-01-01T15:10:00.000Z'
      const timeMatch = timeStr.match(/T(\d{2}):(\d{2}):(\d{2})/)
      if (timeMatch) {
        const hours = timeMatch[1]
        const minutes = timeMatch[2]
        return `${hours}:${minutes}`
      }
      return "Hora inválida"
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Hora inválida"
    }
  }

  // Función para parsear fechas correctamente
  const parseAppointmentDate = (appointment: MedicalAppointment) => {
    try {
      console.log("🔍 Parsing appointment:", {
        id: appointment.id_Cita,
        fecha: appointment.Fecha,
        hora: appointment.Hora,
      })

      if (!appointment.Fecha) {
        console.log("🔍 No fecha found")
        return new Date(Number.NaN)
      }

      // Extraer solo la parte de fecha (YYYY-MM-DD)
      let dateStr = appointment.Fecha
      if (dateStr.includes("T")) {
        dateStr = dateStr.split("T")[0]
      }

      console.log("🔍 Date string extracted:", dateStr)

      // Crear fecha usando componentes individuales para evitar conversión de zona horaria
      const [year, month, day] = dateStr.split("-").map(Number)
      const appointmentDate = new Date(year, month - 1, day)

      console.log("🔍 Base date created:", appointmentDate)

      // Si hay hora, extraerla y agregarla
      if (appointment.Hora) {
        const timeMatch = appointment.Hora.match(/T(\d{2}):(\d{2}):(\d{2})/)
        if (timeMatch) {
          const hours = Number.parseInt(timeMatch[1], 10)
          const minutes = Number.parseInt(timeMatch[2], 10)
          const seconds = Number.parseInt(timeMatch[3], 10)

          appointmentDate.setHours(hours, minutes, seconds, 0)
          console.log("🔍 Time added:", { hours, minutes, seconds })
        }
      }

      console.log("🔍 Final appointment date:", appointmentDate)
      return appointmentDate
    } catch (error) {
      console.error("🔍 Error parsing date:", error)
      return new Date(Number.NaN)
    }
  }

  const confirmedAppointments = appointments
  console.log("🔍 Total appointments:", confirmedAppointments.length)

  // Obtener fecha actual
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  console.log("🔍 Current datetime:", now)
  console.log("🔍 Today date (start of day):", today)

  const todayAppointments = confirmedAppointments.filter((appointment) => {
    const appointmentDate = parseAppointmentDate(appointment)

    if (isNaN(appointmentDate.getTime())) {
      console.log("🔍 Invalid date for appointment:", appointment.id_Cita)
      return false
    }

    // Comparar solo las fechas (sin hora)
    const appointmentDay = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
    )

    const isToday = appointmentDay.getTime() === today.getTime()

    console.log("🔍 Today check:", {
      appointmentId: appointment.id_Cita,
      appointmentDay: appointmentDay.toDateString(),
      today: today.toDateString(),
      isToday,
    })

    return isToday
  })

  const upcomingAppointments = confirmedAppointments.filter((appointment) => {
    const appointmentDate = parseAppointmentDate(appointment)

    if (isNaN(appointmentDate.getTime())) {
      console.log("🔍 Invalid date for upcoming appointment:", appointment.id_Cita)
      return false
    }

    const isUpcoming = appointmentDate > now

    console.log("🔍 Upcoming check:", {
      appointmentId: appointment.id_Cita,
      appointmentDateTime: appointmentDate,
      currentDateTime: now,
      isUpcoming,
    })

    return isUpcoming
  })

  console.log("🔍 Final counts:", {
    total: appointments.length,
    today: todayAppointments.length,
    upcoming: upcomingAppointments.length,
  })

  const renderAppointmentCard = (appointment: MedicalAppointment) => (
    <Card key={appointment.id_Cita} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {appointment.NombrePaciente}
              {appointment.RequiereTutor && (
                <Badge variant="secondary" className="text-xs">
                  Menor de edad
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatAppointmentDate(appointment.Fecha)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatAppointmentTime(appointment.Hora)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {appointment.NombreCentro}
              </span>
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            {appointment.EstadoCita}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{appointment.NombreVacuna}</span>
            <Badge variant="outline" className="text-xs">
              Límite: {appointment.DosisLimite} dosis
            </Badge>
          </div>
          {appointment.DosisAplicadas !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>
                Dosis aplicadas: {appointment.DosisAplicadas} de {appointment.DosisLimite}
              </span>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleAttendAppointment(appointment)} className="flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Atender Paciente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold">Bienvenido a {selectedCenter?.Nombre || 'su centro de trabajo'}</h2>
        <p className="text-muted-foreground">Aquí puede gestionar las citas programadas para hoy y las próximas.</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Citas de Hoy ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Próximas Citas ({upcomingAppointments.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas Programadas para Hoy
              </CardTitle>
              <CardDescription>Pacientes confirmados que deben ser atendidos hoy</CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">{todayAppointments.map(renderAppointmentCard)}</div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay citas programadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximas Citas Confirmadas
              </CardTitle>
              <CardDescription>Citas programadas para los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">{upcomingAppointments.map(renderAppointmentCard)}</div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay citas próximas programadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {selectedAppointment && (
        <AttendAppointmentModal
          appointment={selectedAppointment}
          isOpen={isAttendModalOpen}
          onClose={() => {
            setIsAttendModalOpen(false)
            setSelectedAppointment(null)
          }}
          onSuccess={handleAppointmentAttended}
        />
      )}
    </div>
  )
}
