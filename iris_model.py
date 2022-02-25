import pandas as pd
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier


def training_model():
    """
    This fucntion builds a model from iris dataset

    Returns
    -------
    num
        prediction_value
    """
    data = load_iris()
    # print(data.DESCR)

    X = pd.DataFrame(data.data, columns=(data.feature_names))
    y = pd.DataFrame(data.target, columns=["target"])

    from sklearn.model_selection import train_test_split

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, random_state=1, test_size=0.3
    )

    model = DecisionTreeClassifier()
    trained_model = model.fit(X_train, y_train)
    return trained_model
