import React from 'react';
import './style.css'

export default function RecipeCard({ title, data }) { 
  return (
    <div className="p-4 bg-[#1e2a38] rounded-lg shadow-md hover:scale-101 transition-all duration-300">
      <h2 className="text-xl text-white font-semibold mb-1">{title}</h2>
      <p className="text-[#ff7582] font-semibold mb-3 inline">
        Estimated Cost Outside: ${data["AverageCostOfDishOutside (Estimated)"]}
      </p>
      <p className="text-white mb-3 inline"> | </p>
      <p className="text-[#99EDC3] font-semibold mb-3 inline">
        Estimated Money Saved: ${data.MoneySavedIfMade}
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-[#2C3E50] p-3 rounded border border-[#DE9E48]">
          <h3 className="font-semibold text-white mb-2">Estimated Ingredients Needed</h3>
          <ul className="list-disc list-inside text-sm text-white">
            {data.Ingredients.map((ing, i) => (
              <li key={i}>
                {ing.name}: {ing.amount}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-[#2C3E50] p-3 rounded border border-[#DE9E48]">
          <h3 className="font-semibold text-white mb-2">Estimated Nutritional Values</h3>
          <ul className="text-sm text-white">
            {Object.entries(data["NutritionalValues (Estimated)"]).map(
              ([nutrient, value]) => (
                <li key={nutrient}>
                  {nutrient}: {value}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}