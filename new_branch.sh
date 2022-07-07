#! /bin/bash


release_name=test3
arr=(assignmet1)

for repo in "${arr[@]}"
do
    git clone https://github.com/SumanthSetty777/"$repo".git "$HOME/Documents/newbranch/$repo"
    echo "Cloned Succesfully"

    cd "$HOME/Documents/newbranch/$repo"

    git checkout -b "$release_name"
    echo "Created a branch successfully"
    
    git push origin "$release_name"
    echo "Pushed Successfully"
    
done

