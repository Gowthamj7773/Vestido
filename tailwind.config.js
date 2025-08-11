/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",             // ✅ root entry file
    "./app/**/*.{js,jsx,ts,tsx}",        // ✅ your app/ folder
    "./components/**/*.{js,jsx,ts,tsx}", // ✅ if you have components/
    "./src/**/*.{js,jsx,ts,tsx}",        // ✅ optional for future use
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
              color1 :"#9C84D9",  // here is to fix a color, eg. className="text-color1"
      
      color2 : {          // eg. className="text-color2-100"
        '100': "9C84E3",
        '200' : "9C84D9",
      },
      GViolet:"#8e6cef",
      GGray:"#f4f4f4"
      }
    },
    
  },
  darkMode:'class',
  plugins: [],
};
