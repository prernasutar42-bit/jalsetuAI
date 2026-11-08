# Model Card: FloodWatch Maharashtra AI Risk Classifier

## Model Details
- **Architecture**: Gradient Boosted Decision Trees (XGBoost) with Random Forest Baseline
- **Version**: 1.0.0
- **Lead-Time Horizons**: 24 hours, 48 hours, 72 hours
- **Explainability**: SHAP (SHapley Additive exPlanations) TreeExplainer
- **Primary Input Features**: 15 hydrological and static terrain parameters (zone_id is explicitly omitted)

---

## Intended Use & Regulatory Disclaimers
> **IMPORTANT REGULATORY NOTICE**:
> 1. **Decision-Support Tool Only**: FloodWatch is designed exclusively as an operational decision-support prototype. It is **NOT** a replacement for official warnings and flood bulletins issued by the India Meteorological Department (IMD), the Central Water Commission (CWC), or the Maharashtra State Disaster Management Authority (SDMA).
> 2. **Semi-Synthetic Labels**: Labels used for model development were generated using hydrological threshold exceedance rules and calibrated against historical disaster anchor periods. Metrics reported below reflect performance on generated benchmark labels and **do NOT represent verified real-world operational accuracy**.
> 3. **Approximate Terrain Values**: Static terrain parameters (elevation, slope, distance to nearest major river, and past flood count) are regional approximations and must be verified against official SRTM / Survey of India topographic maps before mission-critical deployment.
> 4. **Anchor Events to be Verified**: Historical anchor events (Mumbai July 2005, Kolhapur and Sangli August 2019, Mahad and Chiplun July 2021, Gadchiroli July 2022) are approximate event windows that require formal validation against district gazettes and post-disaster evaluation reports.

---

## Evaluation Metrics (Out-of-Time Test Set: 2023 - 2024)

| Model | ROC-AUC | Precision | Recall | F1-Score | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Baseline** | 0.9973 | 0.7993 | 0.9834 | 0.8818 | 0.50 |
| **XGBoost Classifier** | 0.9979 | 0.8417 | 0.9783 | 0.9049 | 0.58 |

### Confusion Matrix (XGBoost Test Set)
```
True Negative:  238263    False Positive: 5807
False Negative: 686    True Positive:  30878
```

---

## Risk Level Thresholds
- **Low Risk**: Probability < 0.25
- **Moderate Risk**: 0.25 <= Probability < 0.50
- **High Risk**: 0.50 <= Probability < 0.75
- **Severe Risk**: Probability >= 0.75
