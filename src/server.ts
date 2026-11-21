import app from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Huellas del Sur API ejecutándose en http://localhost:${PORT}`);
});
