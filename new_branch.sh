#! /bin/bash


release_name=test3
arr=(assignment1)

for repo in "${arr[@]}"
do
    git clone https://SumanthSetty777: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@github.com/SumanthSetty777/"$repo".git "$HOME/Documents/newbranch/$repo"
    echo "Cloned Succesfully"

    cd "$HOME/Documents/newbranch/$repo"

    git checkout -b "$release_name"
    echo "Created a branch successfully"
    
    git config credential.helper store
    git push https://SumanthSetty777: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@github.com/SumanthSetty777/"$repo".git "$release_name"
    Username:SumanthSetty777
    Password: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
    
                  
    echo "Pushed Successfully"
    
done

