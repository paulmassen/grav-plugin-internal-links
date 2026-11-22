# Internal Links

Plugin pour l’éditeur Markdown CodeMirror d’Admin2 et le plugin API Grav. Activez le plugin, puis rechargez Admin2. Le compte doit disposer de `api.access` et `api.pages.read`.

Sélectionnez du texte, cliquez sur « Insérer un lien interne », puis choisissez une page. Sans sélection, le lien est inséré avec le curseur entre les crochets. La recherche et la navigation chargent les résultats par pages de 50 au maximum (la configuration API peut imposer une limite inférieure).

## Limites

- L’API de modal Admin2 ne fournit pas l’éditeur appelant ni sa sélection. Ce plugin identifie l’éditeur à partir du bouton de barre d’outils encore focalisé et de la propriété non publique `__cmView`. Si l’identification échoue, aucune insertion n’a lieu. Cette intégration peut casser si Admin2 change son DOM ou sa gestion du focus. Safari sur macOS ne focalise pas toujours les boutons au clic : utilisez la navigation clavier pour focaliser et activer le bouton.
- Si le document ou la sélection change pendant l’ouverture de la fenêtre, l’insertion est refusée : fermez la fenêtre et recommencez. Cela concerne notamment les modifications collaboratives.
- Le lien utilise la route publique renvoyée par l’API et le chemin d’installation du serveur API. Une configuration multilingue, un alias personnalisé ou un serveur API distinct du site public peut nécessiter un ajustement manuel. Une page non publiée ou non routable peut ne pas être accessible aux visiteurs.
- Le fonctionnement avec d’autres éditeurs Markdown ou des versions différentes d’Admin2 n’est pas garanti.
