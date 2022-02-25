import pydoc

from flask import Flask, jsonify, render_template, request

import iris_model
import iris_model_test

app = Flask(__name__)


@app.route("/ip", methods=["GET"])
def get_ip():
    """
    Route to display ip address

    Returns
    -------
    JSON
        returns json with our ip address

    """
    return jsonify({"ip": request.remote_addr}), 200


@app.route("/", methods=["GET", "POST"])
def basic():
    """
    route to display index.html

    parameters
    -------
    flask inputs like request..

    Returns
    -------
    html template
        returns index.html file

    """

    if request.method == "POST":
        sepal_length = request.form["sepallength"]
        sepal_width = request.form["petalwidth"]
        petal_length = request.form["petallength"]
        petal_width = request.form["petalwidth"]
        prediction_value = iris_model_test.test(
            sepal_length, sepal_width, petal_length, petal_width
        )

        return render_template("index.html", prediction_value=prediction_value)

    return render_template("index.html", prediction_value=[-1])


if __name__ == "__main__":
    app.run(debug=True)
