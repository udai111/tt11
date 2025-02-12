import React from 'react';

const TechnicalSummaryWidget = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe 
        src="https://ssltsw.investing.com?chosenTab=%23080808&innerBorderColor=%23000000&lang=56&forex=160,1646,1,2,3,5,9&commodities=8830,8836,8831,8849,8833,8862,8832&indices=23660,166,172,27,179,53094,170&stocks=345,346,347,348,349,350,352&tabs=1,2,3,4" 
        width="100%" 
        height="467"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default TechnicalSummaryWidget;