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
  ["3 Idiots", "2h 51m", 171, 300, "https://images.vocus.cc/0ddfd1a5-95b5-4e7d-8bdc-096ba78f3f4d.jpg", "Comedy", "UA"],
  ["Dangal", "2h 41m", 161, 380, "https://cdns.klimg.com/resized/670x/p/movie/poster/dangal-poster-13052c5mov.jpg", "Drama", "UA"],
  ["Zindagi Na Milegi Dobara", "2h 35m", 155, 340, "https://m.media-amazon.com/images/M/MV5BOGIzYzg5NzItNDRkYS00NmIzLTk3NzQtZWYwY2VlZDhiYWQ4XkEyXkFqcGc%40._V1_.jpg", "Adventure", "UA"],
  ["RRR", "3h 07m", 187, 450, "https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE%40._V1_FMjpg_UX1000_.jpg", "Action", "UA"],
  ["Chhichhore", "2h 23m", 143, 320, "https://m.media-amazon.com/images/M/MV5BMjFkYThiNDMtMmFhYS00ZjQ5LWJjZjMtZmQ3ODAxYmIwM2RlXkEyXkFqcGc%40._V1_.jpg", "Comedy", "UA"],
  ["Drishyam", "2h 43m", 163, 350, "https://m.media-amazon.com/images/M/MV5BMDRlZWFkMjEtYmYyZi00MmE5LWIzMzUtYmM2N2M5Y2UxZDJjXkEyXkFqcGc%40._V1_.jpg", "Thriller", "UA"],
  ["Gully Boy", "2h 36m", 156, 330, "https://br.web.img3.acsta.net/pictures/19/01/03/15/29/1761860.jpg", "Drama", "UA"],
  ["The Lunchbox", "1h 45m", 105, 280, "https://image.tmdb.org/t/p/original/mQ1BS6QJyvVqxrtHmTOZrFbKRIy.jpg", "Romance", "UA"],
  ["Bajrangi Bhaijaan", "2h 43m", 163, 360, "https://m.media-amazon.com/images/S/pv-target-images/fa66a52782127595aa93c1155e37f23651be52fb63b7d48b72df9fd5c9ad5ab3.jpg", "Drama", "UA"],
  ["Baahubali: The Beginning", "2h 39m", 159, 420, "https://media-cache.cinematerial.com/p/500x/afm6yots/baahubali-the-beginning-indian-movie-poster.jpg?v=1456356532", "Fantasy", "UA"]
] as const;
const hallData = [["Premium Hall A", 50], ["Executive Hall B", 30], ["Deluxe Hall C", 80], ["VIP Hall D", 20]] as const;
const snackData = [
  ["Large Popcorn", 250, "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?auto=format&fit=crop&w=1080"],
  ["Medium Popcorn", 180, "https://images.unsplash.com/photo-1667788000434-b83c6985cc28?auto=format&fit=crop&w=1080"],
  ["Soft Drink (Large)", 150, "https://images.unsplash.com/photo-1558416167-29269886c836?auto=format&fit=crop&w=1080"],
  ["Soft Drink (Medium)", 100, "https://images.unsplash.com/photo-1558416167-29269886c836?auto=format&fit=crop&w=1080"],
  ["Nachos with Cheese", 220, "https://images.unsplash.com/photo-1669624272709-c5b91f66b1b7?auto=format&fit=crop&w=1080"],
  ["Hot Dog", 180, "https://images.unsplash.com/photo-1455480570512-42feb248c2b6?auto=format&fit=crop&w=1080"],
  ["Candy Mix", 120, "https://images.unsplash.com/photo-1720924109595-161e675c792f?auto=format&fit=crop&w=1080"],
  ["Combo Deal", 450, "https://images.unsplash.com/photo-1729110970315-97e33011a2b2?auto=format&fit=crop&w=1080"]
] as const;
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
  const snacks = await Snack.insertMany(snackData.map(([name, price, imageUrl]) => ({ name, price, imageUrl, isActive: true })));
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
  console.log("Seeded 10 Indian movies, 4 halls, 8 snacks, and 10 bookings. Admin: admin@minema.local / Minema123!");
  await mongoose.disconnect();
}
seed().catch((error) => { console.error(error); mongoose.disconnect().finally(() => process.exit(1)); });
