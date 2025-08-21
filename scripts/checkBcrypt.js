import bcrypt from "bcrypt";

const password = "password123"; // <-- the plain password you expect
const hash = "$2b$10$ux06wt4A/Nk1E7GJygr7eu47Z0IgCOkJXzfbfsNp4DLZTx9LiGwHC"; // <-- paste the hash directly from MySQL

console.log("hash:", hash);
console.log("len:", hash.length);

bcrypt.compare(password, hash, (err, result) => {
  if (err) throw err;
  console.log("match?", result);
});
