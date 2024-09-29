export const navbarData = [
    {
        routeLink: 'dashboard',
        icon : 'fal fa-home',
        label: 'Dashboard',
        logout: false,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    },
    {
        routeLink: 'products',
        icon : 'fal fa-book',
        label: 'Libros',
        logout: false,
        roles: ["Empleado","Administrador"]
    },
    {
        routeLink: 'catalog',
        icon : 'fal fa-th',
        label: 'Catálogo',
        logout: false,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    },
    {
        routeLink: 'statistics',
        icon : 'fal fa-chart-bar',
        label: 'Reportes',
        logout: false,
        roles: ["Empleado","Administrador"]
    },
    {
        routeLink: 'coupens',
        icon : 'fal fa-tags',
        label: 'Descuentos',
        logout: false,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    },
    {
        routeLink: 'pages',
        icon : 'fal fa-id-card',
        label: 'Socio',
        logout: false,
        roles: ["Socio","Socio registrado"]
    },
    {
        routeLink: 'media',
        icon : 'fal fa-shopping-basket',
        label: 'Alquileres',
        logout: false,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    },
    {
        routeLink: 'settings',
        icon : 'fal fa-user',
        label: 'Usuario',
        logout: false,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    },
    {
        routeLink: '',
        icon : 'fal fa-sign-out',
        label: 'Cerrar sesión',
        logout: true,
        roles: ["Empleado","Socio","Administrador","Socio registrado"]
    }
];