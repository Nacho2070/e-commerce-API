import express from "express";

const app = express();
try{
    const Port = process.env.PORT || 3000;

    app.listen(Port, () => {
        console.log("Server running on port 3000");
    })
}catch(error){
    console.error("Error starting server:", error);
}