#! /bin/bash


release_name=test3
arr=(assignment1 vedx)

for repo in "${arr[@]}"

    git clone https://SumanthSetty777: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@github.com/SumanthSetty777/"$repo".git "$HOME/Documents/newbranch/$repo"
    echo "Cloned Succesfully"

    cd "$HOME/Documents/newbranch/$repo"

    git checkout -b "$release_name"
    echo "Created a branch successfully"
    
    #git config credential.helper store
    git push https://SumanthSetty777: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@github.com/SumanthSetty777/"$repo".git "$release_name"
                  
    echo "Pushed Successfully"
    
done

