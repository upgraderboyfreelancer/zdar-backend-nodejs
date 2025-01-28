import app from "./src/app";


const PORT = process.env.PORT || 9000;


app.listen(PORT, ()=>{
  console.log(`Server has been started: ${PORT}`);
})


