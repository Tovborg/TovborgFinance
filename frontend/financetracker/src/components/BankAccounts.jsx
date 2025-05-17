import { useEffect, useState } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { FaDollarSign, FaEuroSign } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


export default function BankAccounts() {
    const { jwt } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      try {
        const fetchAccounts = async () => {
          const res = await fetch("http://127.0.0.1:8000/accounts", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${jwt}`,
            }
          });
          if (!res.ok) {
            throw new Error("Failed to fetch accounts");
          };
          const data = await res.json();
          setAccounts(data.accounts);
          console.log(data)

        };
        if (jwt) {
          fetchAccounts();
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }, [jwt, navigate]);
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-md w-full">
        <h2 className="text-lg font-semibold text-white mb-4">My accounts</h2>
        <ul className="divide-y divide-gray-700">
          {accounts.map((account, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4"
            >
              {/* Left section: Icon + info */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 mt-1">
                  {account.currency === "EUR" ? (
                    <FaEuroSign size={16} />
                  ) : (
                    <FaDollarSign size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-200">{account.name}</p>
                  <p className="text-sm font-mono text-gray-400">{account.iban}</p>
                </div>
              </div>
  
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
                <button onClick={() => navigate(`/account/${encodeURIComponent(account.id)}`)} className="text-sm px-3 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Account
                </button>
                
              </div>
            </li>
          ))}
        </ul>
  
        <button onClick={() => window.location.href = "/select-bank"} className="mt-4 text-sm px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500">
          + Add new account
        </button>
      </div>
    );
  }