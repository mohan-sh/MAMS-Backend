import bcrypt from "bcrypt";

const password = "password123"; // your plain text password

const hash = await bcrypt.hash(password, 10);
console.log("Hash:", hash);
