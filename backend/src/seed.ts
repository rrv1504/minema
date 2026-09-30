import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Booking } from "./models/Booking.js";
import { Hall } from "./models/Hall.js";
import { Movie } from "./models/Movie.js";
import { OperatingHours } from "./models/OperatingHours.js";
import { Snack } from "./models/Snack.js";
import { User } from "./models/User.js";
import { formatDate } from "./utils/dateTime.js";

const movieData = [
  ["Stellar Odyssey", "2h 45m", 165, 350, "https://images.unsplash.com/photo-1590562177087-ca6af9bb82ea?auto=format&fit=crop&w=1080", "Sci-Fi", "PG-13"],
  ["Action Force", "2h 15m", 135, 400, "https://images.unsplash.com/photo-1765510296004-614b6cc204da?auto=format&fit=crop&w=1080", "Action", "R"],
  ["Mystery Manor", "1h 55m", 115, 300, "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?auto=format&fit=crop&w=1080", "Thriller", "PG-13"],
  ["Dark Shadows", "2h 05m", 125, 350, "https://images.unsplash.com/photo-1767048264833-5b65aacd1039?auto=format&fit=crop&w=1080", "Horror", "R"],
  ["Love in Paris", "1h 50m", 110, 280, "https://images.unsplash.com/photo-1746980931930-d8e69847d633?auto=format&fit=crop&w=1080", "Romance", "PG-13"],
  ["Guardian League", "2h 30m", 150, 450, "https://images.unsplash.com/photo-1724668639593-cbe1a7029494?auto=format&fit=crop&w=1080", "Superhero", "PG-13"],
  ["Magic Kingdom", "1h 45m", 105, 320, "https://images.unsplash.com/photo-1725354870984-e97f219247b4?auto=format&fit=crop&w=1080", "Animation", "G"],
  ["The Last Stand", "2h 20m", 140, 380, "https://images.unsplash.com/photo-1765510296004-614b6cc204da?auto=format&fit=crop&w=1080", "Drama", "R"],
  ["Jungle Quest", "2h 10m", 130, 360, "https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?auto=format&fit=crop&w=1080", "Adventure", "PG"],
  ["Realm of Dragons", "2h 55m", 175, 420, "https://images.unsplash.com/photo-1729782038895-f4793eb5b8d6?auto=format&fit=crop&w=1080", "Fantasy", "PG-13"]
] as const;
const hallData = [["Premium Hall A", 50], ["Executive Hall B", 30], ["Deluxe Hall C", 80], ["VIP Hall D", 20]] as const;
const snackData = [["Large Popcorn", 250], ["Medium Popcorn", 180], ["Soft Drink (Large)", 150], ["Soft Drink (Medium)", 100], ["Nachos with Cheese", 220], ["Hot Dog", 180], ["Candy Mix", 120], ["Combo Deal", 450]] as const;
const seedBookings = [[0, 0, "08:00 PM", 50, ["Large Popcorn", "Soft Drink (Large)"]], [5, 1, "04:00 PM", 30, ["Combo Deal", "Nachos with Cheese"]], [2, 3, "10:00 PM", 20, ["Medium Popcorn"]], [1, 2, "06:00 PM", 80, ["Combo Deal", "Large Popcorn", "Hot Dog"]], [6, 1, "12:00 PM", 30, ["Candy Mix", "Soft Drink (Medium)"]], [4, 3, "06:00 PM", 20, []], [9, 0, "10:00 AM", 50, ["Combo Deal"]], [8, 2, "02:00 PM", 80, ["Large Popcorn", "Soft Drink (Large)", "Nachos with Cheese"]], [3, 0, "10:00 PM", 50, ["Hot Dog", "Candy Mix"]], [7, 1, "10:00 PM", 30, ["Medium Popcorn", "Soft Drink (Medium)"]]] as const;

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Booking.deleteMany({}), User.deleteMany({}), Movie.deleteMany({}), Hall.deleteMany({}), Snack.deleteMany({}), OperatingHours.deleteMany({})]);
  const passwordHash = await bcrypt.hash("Minema123!", 12);
  await User.create({ name: "Admin User", email: "admin@minema.local", phone: "+1234567890", role: "admin", passwordHash });
  const users = await User.insertMany(["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kumar", "Jessica Lee", "Amanda Williams", "Robert Martinez", "Thomas Anderson", "Lisa Thompson", "Christopher Brown"].map((name, index) => ({ name, email: "demo" + (index + 1) + "@minema.local", phone: "+19876543" + String(index).padStart(2, "0"), passwordHash })));
  const movies = await Movie.insertMany(movieData.map(([title, duration, durationMinutes, pricePerPerson, imageUrl, genre, rating]) => ({ title, duration, durationMinutes, pricePerPerson, imageUrl, genre, rating, isActive: true })));
  const halls = await Hall.insertMany(hallData.map(([name, capacity], index) => ({ name, capacity, isActive: true, imageUrl: "https://images.unsplash.com/photo-" + ["1517486518908-97a5f91b325f", "1546217303-900da152c2c0", "1621276458961-c1333f310be8", "1732029541807-1eede3bec4f3"][index] + "?auto=format&fit=crop&w=1080" })));
  const snacks = await Snack.insertMany(snackData.map(([name, price]) => ({ name, price, isActive: true, imageUrl: "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?auto=format&fit=crop&w=1080" })));
  const snackMap = new Map(snacks.map((snack) => [snack.name, snack]));
  const bookings = await Promise.all(seedBookings.map(async ([movieIndex, hallIndex, timeSlot, groupSize, names], index) => {
    const movie = movies[movieIndex];
    const selectedSnacks = names.map((name) => ({ name, price: snackMap.get(name)!.price }));
    const snacksTotal = selectedSnacks.reduce((sum, snack) => sum + snack.price, 0);
    return Booking.create({ userId: users[index]._id, movieId: movie._id, hallId: halls[hallIndex]._id, selectedDate: "2026-03-" + String(index + 1).padStart(2, "0"), timeSlot, groupSize, hallPrice: movie.pricePerPerson * groupSize, snacks: selectedSnacks, snacksTotal, grandTotal: movie.pricePerPerson * groupSize + snacksTotal, bookingDate: new Date("2026-02-25T10:00:00.000Z") });
  }));
  await Promise.all(bookings.map((booking, index) => User.updateOne({ _id: users[index]._id }, { $set: { bookingHistory: [booking._id], preferredGenres: [movies[seedBookings[index][0]].genre] } })));
  await Promise.all(movies.map((movie) => Booking.countDocuments({ movieId: movie._id }).then((totalBookings) => Movie.updateOne({ _id: movie._id }, { totalBookings }))));
  const today = new Date();
  await OperatingHours.insertMany(Array.from({ length: 8 }, (_, offset) => { const date = new Date(today); date.setDate(today.getDate() + offset); return { date: formatDate(date), startTime: "10:00 AM", endTime: "11:00 PM" }; }));
  console.log("Seeded 10 movies, 4 halls, 8 snacks, 10 bookings. Admin: admin@minema.local / Minema123!");
  await mongoose.disconnect();
}
seed().catch((error) => { console.error(error); mongoose.disconnect().finally(() => process.exit(1)); });
