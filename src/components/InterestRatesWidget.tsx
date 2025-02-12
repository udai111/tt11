import React from 'react';

const InterestRatesWidget = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe 
        frameBorder="0" 
        scrolling="no" 
        height="82" 
        width="100%"
        allowtransparency="true"
        marginWidth={0}
        marginHeight={0}
        src="https://sslirates.investing.com/index.php?rows=2&bg1=FFFFFF&bg2=F1F5F8&text_color=333333&enable_border=show&border_color=0452A1&header_bg=0452A1&header_text=FFFFFF&force_lang=56"
      />
    </div>
  );
};

export default InterestRatesWidget;