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
    //withCredentials([usernamePassword(credentialsId: '5a32f9c5-aee6-4368-83b9-98dbd8af656f', passwordVariable: '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', usernameVariable: 'SumanthSetty777')]) { sh('git push https://SumanthSetty777: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@github.com/SumanthSetty777/vedx.git new3')}
                  
    echo "Pushed Successfully"
    
done

