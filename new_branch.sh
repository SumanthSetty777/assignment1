#! /bin/bash


release_name=test2
arr=(r4e-ops-test r4e-demo-tenant)

for repo in "${arr[@]}"
do
    git clone https://github.com/reputation/"$repo".git "$HOME/Documents/newbranch/$repo"
    echo "Cloned Succesfully"

    cd "$HOME/Documents/newbranch/$repo"

    git checkout -b "$release_name"
    echo "Created a branch successfully"
    
    git push origin "$release_name"
    echo "Pushed Successfully"
    
done

