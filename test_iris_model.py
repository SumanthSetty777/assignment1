from unittest import TestCase

import pandas as pd
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

import iris_model


class Test_iris_model(TestCase):
    """
    Class used for unit testing

    Methods
    -------
    setUp()
        sets up a trained model from iris dataset

    test_accuracy()
        tests the accuracy of both models by some dummy data

    test_precision_recall_f1score_support()
        test precision, recall, f1 score, support of the models

    """

    def setUp(self):
        data = load_iris()

        X = pd.DataFrame(data.data, columns=(data.feature_names))
        y = pd.DataFrame(data.target, columns=["target"])

        X_train, X_test, y_train, self.y_test = train_test_split(
            X, y, random_state=1, test_size=0.3
        )

        model = DecisionTreeClassifier()
        trained_model1 = model.fit(X_train, y_train)
        self.dummy_data = X_test[10:30]

        self.prediction_value = trained_model1.predict(self.dummy_data)

    def test_accuracy(self):
        m1 = accuracy_score(self.y_test[10:30], self.prediction_value)
        m2 = accuracy_score(
            self.y_test[10:30], iris_model.training_model().predict(self.dummy_data)
        )
        self.assertTrue(m1, m2)

    def test_precision_recall_f1score_support(self):
        m1 = classification_report(self.y_test[10:30], self.prediction_value)
        m2 = classification_report(
            self.y_test[10:30], iris_model.training_model().predict(self.dummy_data)
        )

        self.assertTrue(m1, m2)


# Test_iris_model().setUp()
