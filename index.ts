import app from "./src/app";
import "./cron/subscriptionJob";

const PORT = process.env.PORT || 9000;


app.listen(PORT, ()=>{
  console.log(`Server has been started: ${PORT}`);
})


