"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { Users, Calendar, AlertTriangle, TrendingUp, Syringe, Clock, CheckCircle } from "lucide-react"

const mockStats = {
  totalPatients: 1247,
  todayAppointments: 23,
  pendingAlerts: 8,
  completedVaccinations: 156,
  upcomingDoses: 45,
  incompleteSchemes: 12,
}

const mockAlerts = [
  {
    id: 1,
    type: "warning",
    message: "12 pacientes con esquemas de vacunación incompletos",
    priority: "high",
  },
  {
    id: 2,
    type: "info",
    message: "45 dosis programadas para los próximos 7 días",
    priority: "medium",
  },
  {
    id: 3,
    type: "success",
    message: "Meta mensual de vacunación alcanzada al 89%",
    priority: "low",
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    patient: "María González",
    vaccine: "COVID-19 (2da dosis)",
    time: "09:30",
    center: "Centro Norte",
  },
  {
    id: 2,
    patient: "Carlos Rodríguez",
    vaccine: "Influenza",
    time: "10:15",
    center: "Centro Sur",
  },
  {
    id: 3,
    patient: "Ana Martínez",
    vaccine: "Hepatitis B (1ra dosis)",
    time: "11:00",
    center: "Centro Norte",
  },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.email}. Aquí tienes un resumen de la actividad del sistema.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">3 citas pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacunaciones</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.completedVaccinations}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingAlerts}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Alerts Section */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas y Notificaciones
              </CardTitle>
              <CardDescription>Información importante que requiere tu atención</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {alert.type === "info" && <Clock className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.priority === "high" ? "destructive" : alert.priority === "medium" ? "default" : "secondary"
                    }
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Citas
              </CardTitle>
              <CardDescription>Citas programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.vaccine}</p>
                    <p className="text-xs text-muted-foreground">{appointment.center}</p>
                  </div>
                  <Badge variant="outline">{appointment.time}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ver todas las citas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Registrar Paciente
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Syringe className="h-6 w-6" />
                Nueva Vacunación
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                Agendar Cita
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                Ver Reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
