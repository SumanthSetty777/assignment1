import iris_model


def test(sepal_length, sepal_width, petal_length, petal_width):
    """
    parameters
    -------
    sepal_length: int
    sepal_width: int
    petal_length: int
    petal_width: int

    Returns
    -------
    num
        prediction_value
    """
    y_pred = [[sepal_length, sepal_width, petal_length, petal_width]]
    trained_model = iris_model.training_model()
    prediction_value = trained_model.predict(y_pred)
    return prediction_value
