from train_model import main as train_main
from predict_and_update import run_prediction_update

if __name__ == "__main__":
    print("🚀 Starting full ML pipeline: Train + Predict + Update")

    # Step 1: Retrain
    train_main()
    print("✅ Model retrained and saved to model.pkl")

    # Step 2: Predict with new model
    run_prediction_update()
    print("🎉 Prediction completed and DB updated with fresh discounts!")
