import React from "react";
import "../styles/HadeesStrip.css";

const HadeesStrip = () => {
  return (
    <div className="bzak-hadees-strip">
      <div className="bzak-hadees-track">
        {[1, 2, 3].map((i) => (
          <span className="bzak-hadees-group" key={i}>
            <span className="bzak-hadees-arabic" lang="ar" dir="rtl">
              قَوْلُ النَّبِيِّ ﷺ: «مَنْ غَشَّنَا فَلَيْسَ مِنَّا»
            </span>
            <span className="bzak-hadees-sep">✦</span>
            <span className="bzak-hadees-english">
              The saying of the Prophet (ﷺ): "Whoever deceives us is not one of us."
            </span>
            <span className="bzak-hadees-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default HadeesStrip;