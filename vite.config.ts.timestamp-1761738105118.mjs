// vite.config.ts
import { defineConfig } from "file:///Users/avi/dev/avio/sb/sb-chat-ui/node_modules/vite/dist/node/index.js";
import react from "file:///Users/avi/dev/avio/sb/sb-chat-ui/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/Users/avi/dev/avio/sb/sb-chat-ui";
var vite_config_default = defineConfig(({ command }) => {
  const commonConfig = {
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      proxy: {
        "/api": "http://localhost:3000"
      },
      fs: {
        strict: false
      }
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
      strictPort: true,
      host: true
    },
    plugins: [
      react(),
      // SPA fallback middleware for dev server
      {
        name: "spa-fallback",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (((_a = req.url) == null ? void 0 : _a.startsWith("/@")) || ((_b = req.url) == null ? void 0 : _b.startsWith("/node_modules/"))) {
              return next();
            }
            if ((_c = req.url) == null ? void 0 : _c.startsWith("/api")) {
              return next();
            }
            if (((_d = req.url) == null ? void 0 : _d.startsWith("/src/")) || ((_e = req.url) == null ? void 0 : _e.startsWith("/public/")) || ((_f = req.url) == null ? void 0 : _f.startsWith("/package.json"))) {
              return next();
            }
            if ((_g = req.url) == null ? void 0 : _g.match(/\/admin\/assistants\/[^/]+\/workspace\//)) {
              req.url = "/index.html";
              return next();
            }
            const hasExtension = /\.[a-zA-Z0-9]+$/.test(req.url || "");
            if (hasExtension && !((_h = req.url) == null ? void 0 : _h.endsWith(".html"))) {
              return next();
            }
            if (req.url && !hasExtension) {
              req.url = "/index.html";
            }
            next();
          });
        }
      }
    ],
    build: {
      chunkSizeWarningLimit: 1e3
      // Increase the chunk size warning limit to 1MB (adjust as needed)
    }
  };
  if (command === "build") {
    return {
      ...commonConfig,
      define: {
        // Define placeholder values that will be replaced at runtime
        "import.meta.env.VITE_API_URL": JSON.stringify("%VITE_API_URL%"),
        "import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID": JSON.stringify("%VITE_GOOGLE_AUTH_CLIENT_ID%"),
        "import.meta.env.VITE_PUSHER_APP_KEY": JSON.stringify("%VITE_PUSHER_APP_KEY%"),
        "import.meta.env.VITE_PUSHER_CLUSTER": JSON.stringify("%VITE_PUSHER_CLUSTER%")
      }
    };
  }
  return commonConfig;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYXZpL2Rldi9hdmlvL3NiL3NiLWNoYXQtdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hdmkvZGV2L2F2aW8vc2Ivc2ItY2hhdC11aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYXZpL2Rldi9hdmlvL3NiL3NiLWNoYXQtdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+IHtcbiAgY29uc3QgY29tbW9uQ29uZmlnID0ge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgfSxcbiAgICAgIGZzOiB7XG4gICAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgcG9ydDogcHJvY2Vzcy5lbnYuUE9SVCA/IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQsIDEwKSA6IDgwODAsXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICAvLyBTUEEgZmFsbGJhY2sgbWlkZGxld2FyZSBmb3IgZGV2IHNlcnZlclxuICAgICAge1xuICAgICAgICBuYW1lOiAnc3BhLWZhbGxiYWNrJyxcbiAgICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICAvLyBTa2lwIFZpdGUgaW50ZXJuYWwgcmVxdWVzdHMgKEhNUiwgUmVhY3QgRmFzdCBSZWZyZXNoLCBldGMuKVxuICAgICAgICAgICAgaWYgKHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9AJykgfHwgcmVxLnVybD8uc3RhcnRzV2l0aCgnL25vZGVfbW9kdWxlcy8nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTa2lwIEFQSSByZXF1ZXN0c1xuICAgICAgICAgICAgaWYgKHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9hcGknKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTa2lwIHNvdXJjZSBmaWxlcyAoc3JjLywgcHVibGljLywgZXRjLilcbiAgICAgICAgICAgIGlmIChyZXEudXJsPy5zdGFydHNXaXRoKCcvc3JjLycpIHx8IHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9wdWJsaWMvJykgfHwgcmVxLnVybD8uc3RhcnRzV2l0aCgnL3BhY2thZ2UuanNvbicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdvcmtzcGFjZSByb3V0ZXMgc2hvdWxkIGFsd2F5cyBmYWxsYmFjayB0byBpbmRleC5odG1sICh0aGV5J3JlIHZpcnR1YWwgcm91dGVzKVxuICAgICAgICAgICAgLy8gTWF0Y2ggYWN0dWFsIHdvcmtzcGFjZSByb3V0ZXMgbGlrZSAvYWRtaW4vYXNzaXN0YW50cy97aWR9L3dvcmtzcGFjZS97cGF0aH1cbiAgICAgICAgICAgIGlmIChyZXEudXJsPy5tYXRjaCgvXFwvYWRtaW5cXC9hc3Npc3RhbnRzXFwvW14vXStcXC93b3Jrc3BhY2VcXC8vKSkge1xuICAgICAgICAgICAgICByZXEudXJsID0gJy9pbmRleC5odG1sJztcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yIHN0YXRpYyBhc3NldHMsIGNoZWNrIGlmIHRoZXkgYWN0dWFsbHkgZXhpc3RcbiAgICAgICAgICAgIGNvbnN0IGhhc0V4dGVuc2lvbiA9IC9cXC5bYS16QS1aMC05XSskLy50ZXN0KHJlcS51cmwgfHwgJycpO1xuICAgICAgICAgICAgaWYgKGhhc0V4dGVuc2lvbiAmJiAhcmVxLnVybD8uZW5kc1dpdGgoJy5odG1sJykpIHtcbiAgICAgICAgICAgICAgLy8gTGV0IFZpdGUgdHJ5IHRvIHNlcnZlIGl0IGFzIGEgc3RhdGljIGFzc2V0XG4gICAgICAgICAgICAgIC8vIElmIGl0IGRvZXNuJ3QgZXhpc3QsIFZpdGUgd2lsbCBoYW5kbGUgdGhlIDQwNFxuICAgICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3IgYWxsIG90aGVyIHJvdXRlcyB3aXRob3V0IGV4dGVuc2lvbnMsIHNlcnZlIGluZGV4Lmh0bWwgKFNQQSBmYWxsYmFjaylcbiAgICAgICAgICAgIGlmIChyZXEudXJsICYmICFoYXNFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgcmVxLnVybCA9ICcvaW5kZXguaHRtbCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLCAvLyBJbmNyZWFzZSB0aGUgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0IHRvIDFNQiAoYWRqdXN0IGFzIG5lZWRlZClcbiAgICB9LFxuICB9O1xuXG4gIGlmIChjb21tYW5kID09PSAnYnVpbGQnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmNvbW1vbkNvbmZpZyxcbiAgICAgIGRlZmluZToge1xuICAgICAgICAvLyBEZWZpbmUgcGxhY2Vob2xkZXIgdmFsdWVzIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBhdCBydW50aW1lXG4gICAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9BUElfVVJMJzogSlNPTi5zdHJpbmdpZnkoJyVWSVRFX0FQSV9VUkwlJyksXG4gICAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9HT09HTEVfQVVUSF9DTElFTlRfSUQnOiBKU09OLnN0cmluZ2lmeSgnJVZJVEVfR09PR0xFX0FVVEhfQ0xJRU5UX0lEJScpLFxuICAgICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfUFVTSEVSX0FQUF9LRVknOiBKU09OLnN0cmluZ2lmeSgnJVZJVEVfUFVTSEVSX0FQUF9LRVklJyksXG4gICAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9QVVNIRVJfQ0xVU1RFUic6IEpTT04uc3RyaW5naWZ5KCclVklURV9QVVNIRVJfQ0xVU1RFUiUnKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb21tb25Db25maWc7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUyxvQkFBb0I7QUFDbFQsT0FBTyxXQUFXO0FBRWxCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUMzQyxRQUFNLGVBQWU7QUFBQSxJQUNuQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNLFFBQVEsSUFBSSxPQUFPLFNBQVMsUUFBUSxJQUFJLE1BQU0sRUFBRSxJQUFJO0FBQUEsTUFDMUQsWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQTtBQUFBLE1BRU47QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGdCQUFnQixRQUFRO0FBQ3RCLGlCQUFPLFlBQVksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTO0FBL0JyRDtBQWlDWSxrQkFBSSxTQUFJLFFBQUosbUJBQVMsV0FBVyxZQUFTLFNBQUksUUFBSixtQkFBUyxXQUFXLG9CQUFtQjtBQUN0RSxxQkFBTyxLQUFLO0FBQUEsWUFDZDtBQUdBLGlCQUFJLFNBQUksUUFBSixtQkFBUyxXQUFXLFNBQVM7QUFDL0IscUJBQU8sS0FBSztBQUFBLFlBQ2Q7QUFHQSxrQkFBSSxTQUFJLFFBQUosbUJBQVMsV0FBVyxlQUFZLFNBQUksUUFBSixtQkFBUyxXQUFXLGtCQUFlLFNBQUksUUFBSixtQkFBUyxXQUFXLG1CQUFrQjtBQUMzRyxxQkFBTyxLQUFLO0FBQUEsWUFDZDtBQUlBLGlCQUFJLFNBQUksUUFBSixtQkFBUyxNQUFNLDRDQUE0QztBQUM3RCxrQkFBSSxNQUFNO0FBQ1YscUJBQU8sS0FBSztBQUFBLFlBQ2Q7QUFHQSxrQkFBTSxlQUFlLGtCQUFrQixLQUFLLElBQUksT0FBTyxFQUFFO0FBQ3pELGdCQUFJLGdCQUFnQixHQUFDLFNBQUksUUFBSixtQkFBUyxTQUFTLFdBQVU7QUFHL0MscUJBQU8sS0FBSztBQUFBLFlBQ2Q7QUFHQSxnQkFBSSxJQUFJLE9BQU8sQ0FBQyxjQUFjO0FBQzVCLGtCQUFJLE1BQU07QUFBQSxZQUNaO0FBRUEsaUJBQUs7QUFBQSxVQUNQLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLHVCQUF1QjtBQUFBO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZLFNBQVM7QUFDdkIsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsUUFBUTtBQUFBO0FBQUEsUUFFTixnQ0FBZ0MsS0FBSyxVQUFVLGdCQUFnQjtBQUFBLFFBQy9ELDhDQUE4QyxLQUFLLFVBQVUsOEJBQThCO0FBQUEsUUFDM0YsdUNBQXVDLEtBQUssVUFBVSx1QkFBdUI7QUFBQSxRQUM3RSx1Q0FBdUMsS0FBSyxVQUFVLHVCQUF1QjtBQUFBLE1BQy9FO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
