import { createWebHistory, createRouter } from "vue-router";
import LoginAdmin from "../views/auth/LoginAdmin.vue";
import AdminLayouts from "../layouts/AdminLayouts.vue";
import DashboardAdmin from "../views/admin/DashboardAdmin.vue";
import EventAdmin from "../views/admin/EventAdmin.vue";
import SettingsAdmin from "../views/admin/SettingsAdmin.vue";
import Account from "../views/admin/layer setting/Account.vue";
import MainLayout from "../layouts/MainLayout.vue";
import HomeMain from "../views/main/HomeMain.vue";
import store from "../store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/admin/login",
      name: "LoginAdmin",
      component: LoginAdmin,
      meta: {
        title: "Login Admin",
      },
      beforeEnter: (to, from, next) => {
        const isAuthenticated = store.getters["auth/isAuthenticated"];
        if (isAuthenticated) {
          // Jika pengguna sudah login, arahkan ke halaman yang sesuai dengan rolenya
          const role = localStorage.getItem("role");
          if (role === "admin") {
            next("/admin/dashboard");
          } else {
            next("/");
          }
        } else {
          // Menampilkan halaman loading selama 1 detik sebelum masuk ke komponen
          setTimeout(() => {
            next();
          }, 1000);
        }
      },
    },

    {
      path: "/",
      component: MainLayout,
      name: "MainLayout",
      meta: {
        title: "home",
      },
      children: [
        {
          path: "/",
          component: HomeMain,
          name: "HomeMain",
          meta: {
            title: "home",
          },
        },
      ],
    },



    {
      path: "/admin/dashboard",
      component: AdminLayouts,
      name: "AdminLayouts",
      meta: {
        title: "Admin Dashboard",
        requiresLogin: true,
        requiresAdmin: true,
      },
      children: [
        {
          path: "/admin/dashboard",
          component: DashboardAdmin,
          name: "DashboardAdmin",
          meta: {
            title: "Admin Dashboard",
          },
        },
        {
          path: "/admin/event",
          component: EventAdmin,
          name: "EventAdmin",
          meta: {
            title: "Admin Event",
          },
        },
      ],
    },
    // settings
    {
      path: "/admin/settings",
      component: SettingsAdmin,
      name: "SettingsAdmin",
      meta: {
        title: "settings",
        requiresLogin: true,
        requiresAdmin: true,
      },
      children: [
        {
          path: "/admin/settings",
          component: Account,
          name: "Account",
          meta: {
            title: "settings-account",
          },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];
  const role = localStorage.getItem("role");

  if (!isAuthenticated) {
    // Jika tidak terautentikasi, periksa token kedaluwarsa
    await store.dispatch("auth/checkTokenExpiration");
  }

  if (to.meta.requiresLogin && !isAuthenticated) {
    // Redirect ke halaman login jika diperlukan login dan pengguna tidak terautentikasi
    next("/admin/login");
  } else if (to.meta.requiresAdmin && role !== "admin") {
    // Redirect ke halaman dashboard admin jika diperlukan admin dan pengguna bukan admin
    next("/admin/dashboard");
  } else if (to.meta.requiresUser && role !== "user") {
    // Redirect ke halaman home jika diperlukan user dan pengguna bukan user
    next("/");
  } else {
    // Continue with navigation
    next();
  }
});

export default router;
