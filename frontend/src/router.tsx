import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { AppShell } from '@/components/sige/AppShell';
import { FiltersProvider } from '@/lib/filters';
import { JogoCatalogPage } from '@/pages/JogoCatalogPage';
import { JogoDetailPage } from '@/pages/JogoDetailPage';
import { MapaPage } from '@/pages/MapaPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { RankingsPage } from '@/pages/RankingsPage';
import { RelatoriosPage } from '@/pages/RelatoriosPage';

const rootRoute = createRootRoute({
  component: () => (
    <FiltersProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </FiltersProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewPage,
});

const mapaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mapa',
  component: MapaPage,
});

const rankingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rankings',
  component: RankingsPage,
});

const jogoCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jogo',
  component: JogoCatalogPage,
});

const jogoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jogo/$id',
  component: JogoDetailPage,
});

const relatoriosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relatorios',
  component: RelatoriosPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  mapaRoute,
  rankingsRoute,
  jogoCatalogRoute,
  jogoDetailRoute,
  relatoriosRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
