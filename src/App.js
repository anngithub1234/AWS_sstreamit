import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { fetchAuthSession } from "@aws-amplify/auth";
import awsExports from "./aws-exports";
import Home from "./pages/Home";
import DreamStreamer from "./components/DreamStreamer/DreamStreamer";
import AdminDashboard from "./pages/AdminDashboard";
import SongsLib from "./pages/Songs"
import "./App.css"
import ViewPurchasedAlbums from "./pages/ViewPurchasedAlbums";
import AddAlbum from "./pages/AddAlbum";

Amplify.configure(awsExports);

function App({ signOut }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        console.log("Session:", session);

        const accessToken = session.tokens?.accessToken;
        if (!accessToken) {
          console.error("Access Token is missing in the session object");
          return;
        }

        const groups = accessToken.payload["cognito:groups"];
        console.log("User Groups:", groups);
        if (groups && groups.includes("admin")) {
          console.log("User is an admin");
          setIsAdmin(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching session:", error);
      });
  }, []);

  const AdminRoleWrapper = () => {
    return isAdmin ? (
      <AdminDashboard signOut={signOut} />
    ) : (
      <DreamStreamer signOut={signOut} />
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AdminRoleWrapper />,
    },
    {
      path: "/home",
      element: <Home signOut={signOut} />,
    },
    {
      path: "/dreamstreamer",
      element: <DreamStreamer signOut={signOut} />,
    },

    {
      path: "/SongsLib",
      element: <SongsLib signOut={signOut} />,
    },

    {
      path: "/ViewPurchasedAlbums",
      element:<ViewPurchasedAlbums/>
    },
    {
      path: "/AddAlbum",
      element:<AddAlbum  signOut={signOut}/>
    }
   
  ]);

  return <RouterProvider router={router} />;
}

function AppWithAuth() {
  return (
    <Authenticator>{({ signOut }) => <App signOut={signOut} />}</Authenticator>
  );
}

export default withAuthenticator(AppWithAuth);