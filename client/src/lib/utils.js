import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "INR", locale = "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}


// export function formatDate(date) {
//   if (!date) return "";
//   const d = new Date(date);
//   return d.toLocaleDateString("en-IN", {
//     year: "numeric",
//     month: "numeric", 
//     day: "numeric",
//   });
// }

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // set to false if you want 24-hour format
  });
}

export function trimName(str){
  if(str.length > 15){
    return str.substring(0, 15) + "....."
  }
  return str
}

export function capitalize(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}