import axios from 'axios';

const executeCode = async (language, code) => {
    const options = {
        method: 'POST',
        url: 'https://online-code-compiler.p.rapidapi.com/v1/',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your key
            'X-RapidAPI-Host': 'online-code-compiler.p.rapidapi.com'
        },
        data: {
            language: language,
            version: "latest",
            code: code,
            input: "" // You can modify this if user input is required
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Error executing code:", error);
        return { error: "Execution failed" };
    }
};

export default executeCode;
